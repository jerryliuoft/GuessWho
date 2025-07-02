import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _message = signal<string | null>(null);
  private _visible = signal(false);

  get message() {
    return this._message();
  }
  get visible() {
    return this._visible();
  }

  show(message: string, duration = 3000) {
    this._message.set(message);
    this._visible.set(true);
    setTimeout(() => {
      this._visible.set(false);
      this._message.set(null);
    }, duration);
  }
}
