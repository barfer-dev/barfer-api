import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { Roles } from '../../common/enums/roles.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { ProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';
import { GoogleSheetsService } from '../google-sheet/google-sheet.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  @Post('/new')
  @Auth(Roles.Admin)
  create(@Body() createProductDto: ProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('by-type/:type')
  findByType(@Param('type') type: string) {
    return this.productsService.findByType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOneById(id);
  }

  @Patch('byId/:id')
  @Auth(Roles.Admin)
  update(@Param('id') id: string, @Body() updateProductDto: ProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete('byId/:id')
  @Auth(Roles.Admin)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('by-category/:id')
  findByCategory(
    @Param('id') id: string,
    @Query('product-type') productType?: string
  ) {
    return this.productsService.findByCategory(id, productType);
  }

  @Get('sort/by-price')
  sortByPrice() {
    return this.productsService.findAllSortingByPrice();
  }

  @Get('sold/most-sold')
  mostSold() {
    return this.productsService.mostSold();
  }

  @Get('feed/google-merchant')
  getGoogleMerchantFeed() {
    return this.productsService.getGoogleMerchantFeed();
  }

  @Post('add-to-sheet')
  // @Auth(Roles.Admin)
  async addToSheet(@Body() product: any) {
    console.log('Producto recibido para agregar al sheet:', product);
    await this.googleSheetsService.addProductToSheet(product);
    return { message: 'Producto agregado al sheet' };
  }
}
