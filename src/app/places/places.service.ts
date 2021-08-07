/* eslint-disable @typescript-eslint/semi */
/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-body-style */
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.model';
import { delay, map, take, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';

/*[
  // eslint-disable-next-line max-len
  new Place(
    'p1',
    'Manhttan Mansion',
    'in the the best city in the world ',
    // eslint-disable-next-line max-len
    'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
    149.99,
    new Date('2021-01-01'),
    new Date('2021-12-31'),
    'xyz'
  ),
  new Place(
    'p2',
    'LAmour Toujours',
    'Romantic place in paris ',
    // eslint-disable-next-line max-len
    'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
    189.99,
    new Date('2021-01-01'),
    new Date('2021-12-31'),
    'xyz'
  ),
  new Place(
    'p3',
    'The foggy Place',
    'suprice ',
    // eslint-disable-next-line max-len
    'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
    249.99,
    new Date('2021-01-01'),
    new Date('2021-12-31'),
    'xyz'
  ),
]**/

interface PlaceData {
  avilableFrom: string;
  avilableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}
@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    // eslint-disable-next-line no-underscore-dangle
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceData }>(
        'https://ionic-angular-booking-5501f-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].avilableFrom),
                  new Date(resData[key].avilableTo),
                  resData[key].userId
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.http
      .get<PlaceData>(
        `https://ionic-angular-booking-5501f-default-rtdb.europe-west1.firebasedatabase.app/offered-places/.json`
      )
      .pipe(
        map((placeData) => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.avilableFrom),
            new Date(placeData.avilableTo),
            placeData.userId
          );
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://upload.wikimedia.org/wikipedia/commons/0/01/San_Francisco_with_two_bridges_and_the_fog.jpg',
      price,
      dateFrom,
      dateTo,
      // eslint-disable-next-line no-underscore-dangle
      this.authService.userId
    );
    return this.http
      .post<{ name: string }>(
        'https://ionic-angular-booking-5501f-default-rtdb.europe-west1.firebasedatabase.app/offered-places.json',
        { ...newPlace, id: null }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // eslint-disable-next-line no-underscore-dangle
    //return this.places.pipe(
    //take(1),
    //delay(1500),
    //tap((places) => {
    //this._places.next(places.concat(newPlace));
    //})
    //);
  }
  updatePlace(placeId: string, title: string, description: string) {
    let updetedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updetedPlaces = [...places];
        const oldPlace = updetedPlaces[updatedPlaceIndex];
        // eslint-disable-next-line max-len
        updetedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.avilableFrom,
          oldPlace.avilableTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-angular-booking-5501f-default-rtdb.europe-west1.firebasedatabase.app/offered-places/${placeId}.json`,
          { ...updetedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updetedPlaces);
      })
    );
  }
}
