import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguageDto } from 'src/dtos/languages/language.dto';

@Controller('languages')
export class LanguagesController {
    constructor(private readonly languagesService: LanguagesService) {}

    @Post()
    create(@Body() dto: LanguageDto) {
        return this.languagesService.create(dto);
    }

    @Get()
    findAll() {
        return this.languagesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.languagesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: LanguageDto,) {
        return this.languagesService.update(id, dto);
    }
  
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.languagesService.delete(+id);
    }
}
