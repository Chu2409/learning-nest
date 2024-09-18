import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemons/entities/pokemon.entity';
import { CreatePokemonDto } from 'src/pokemons/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) {}

  // async executeSeed() {
  //   await this.pokemonModel.deleteMany({});

  //   const { data } = await this.axios.get<PokeResponse>(
  //     'https://pokeapi.co/api/v2/pokemon?limit=10',
  //   );

  //   const insertPromisesArray = [];

  //   data.results.forEach(({ name, url }) => {
  //     const segments = url.split('/');
  //     const no = +segments[segments.length - 2];

  //     // console.log({ no, name });
  //     insertPromisesArray.push(this.pokemonModel.create({ no, name }));
  //   });

  //   await Promise.all(insertPromisesArray);
  //   return 'Seed executed';
  // }

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonToInsert: CreatePokemonDto[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      // console.log({ no, name });
      pokemonToInsert.push({ no, name });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }
}
