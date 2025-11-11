import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../../schemas/address.schema';
import { GoogleMapsService } from './google-maps.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AddressController],
  providers: [AddressService, GoogleMapsService],
  exports: [AddressService],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: Address.name,
        schema: AddressSchema,
      },
    ]),
  ],
})
export class AddressModule {}
