import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Survey } from '../../schemas/surveys.schema';
import { SurveyResponse } from '../../schemas/survey_responses';
import { Order } from '../../schemas/order.schema';

@Injectable()
export class SurveysService {
    constructor(
        @InjectModel(Survey.name) private surveyModel: Model<Survey>,
        @InjectModel(SurveyResponse.name) private responseModel: Model<SurveyResponse>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
    ) { }

    //api para buscar que usuarios les corresponde la encuesta
    async findClientsByAnswerMetadata(tag: string, valueQuery: any) {
        console.log("tag", tag);
        console.log("valueQuery", valueQuery);
        return this.responseModel
            .find({
                'answers.metadata.tag': tag,
                'answers.value': valueQuery,
            })
            .populate('userId', 'email')
            .select('userId completedAt')
            .exec();
    }

    async getPostPurchaseSurvey(userId: string, userEmail: string) {
        console.log("userId", userId);
        console.log("userEmail", userEmail);
        // Verificar que sea exactamente su primera orden 
        // Primero buscamos si el usuario tiene solo 1 compra comprobando user.email u userId.
        const ordersCount = await this.orderModel.countDocuments({
            'user.email': userEmail,
            // Solo contamos órdenes con estado válido (opcional, asumiendo que 1 es confirmada)
            // status: { $ne: 'cancelled' } 
        });

        // Si no tiene exactamente 1 orden (la que acaba de realizar), no muestra la encuesta.
        if (ordersCount !== 1) {
            return null;
        }

        // Buscar encuesta activa de post-purchase
        const activeSurvey = await this.surveyModel.findOne({
            status: 'active',
            trigger: 'post-purchase',
        });

        if (!activeSurvey) {
            return null;
        }

        // Verificar que el usuario no haya completado ya esta encuesta
        const existingResponse = await this.responseModel.findOne({
            surveyId: activeSurvey._id,
            userId: new Types.ObjectId(userId)
        });

        if (existingResponse) {
            return null;
        }

        return activeSurvey;
    }

    async submitSurveyResponse(surveyId: string, userId: string, orderId: string, answers: any[]) {
        const activeSurvey = await this.surveyModel.findOne({ _id: surveyId, status: 'active' });

        if (!activeSurvey) {
            throw new NotFoundException('Encuesta no encontrada o inactiva');
        }

        const newResponse = new this.responseModel({
            surveyId: new Types.ObjectId(surveyId),
            userId: new Types.ObjectId(userId),
            orderId: orderId ? new Types.ObjectId(orderId) : undefined,
            answers,
            completedAt: new Date(),
        });

        return newResponse.save();
    }
}
