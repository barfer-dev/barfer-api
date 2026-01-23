import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'puntos_envio',
    timestamps: true
})
export class PuntoEnvio extends Document {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: false })
    cutoffTime: string;
}

export const PuntoEnvioSchema = SchemaFactory.createForClass(PuntoEnvio);
