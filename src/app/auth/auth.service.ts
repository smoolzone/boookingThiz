import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userIsAuthenticated = true;
  private _userId = 'sss';

  get userIsAuthenticated() {
    // eslint-disable-next-line no-underscore-dangle
    return this._userIsAuthenticated;
  }

  get userId() {
    // eslint-disable-next-line no-underscore-dangle
    return this._userId;
  }

  constructor() {}

  login() {
    // eslint-disable-next-line no-underscore-dangle
    this._userIsAuthenticated = true;
  }

  logout() {
    // eslint-disable-next-line no-underscore-dangle
    this._userIsAuthenticated = false;
  }
}
