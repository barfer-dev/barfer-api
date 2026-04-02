import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';
import { Request } from 'express';

@Controller('surveys')
export class SurveysController {
    constructor(private readonly surveysService: SurveysService) { }

    @Get('post-purchase')
    @Auth(Roles.User)
    getPostPurchaseSurvey(@Req() req: Request) {
        const userId = req['user']?.sub;
        const userEmail = req['user']?.email;
        return this.surveysService.getPostPurchaseSurvey(userId, userEmail);
    }

    @Post('responses')
    @Auth(Roles.User)
    submitSurveyResponse(@Req() req: Request, @Body() body: any) {
        const userId = req['user']?.sub;
        return this.surveysService.submitSurveyResponse(body.surveyId, userId, body.orderId, body.answers);
    }
}
