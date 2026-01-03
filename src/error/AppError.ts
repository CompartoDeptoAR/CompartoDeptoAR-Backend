export class AppError extends Error {
  statusCode: number;

  constructor(mensaje: string, statusCode = 500) {
    super(mensaje);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}