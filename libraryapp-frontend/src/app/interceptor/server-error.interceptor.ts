import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment.development";
import { catchError, EMPTY, retry, tap } from "rxjs";

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackBar = inject(MatSnackBar);
    const router = inject(Router);

    const retryCount = req.method === 'GET' ? environment.RETRY : 0;

    return next(req).pipe(
        tap(event => {
            const body =
                event instanceof HttpResponse
                ? (event.body as { error?: boolean; errorMessage?: string })
                : null;
            if (body?.error === true && body.errorMessage) {
                throw new Error(body.errorMessage);
            }
        }),
        retry({ count: retryCount, delay: 1000}),
        catchError(err => {

            if (err.status === 400) {
                snackBar.open(err.message, 'ERROR 400', { duration: 5000 });
            } else if (err.status === 404) {
                snackBar.open('No existe el recurso', 'ERROR 404', { duration: 5000 });
            } else if (err.status === 401) {
                snackBar.open('No autorizado', 'ERROR 401', { duration: 5000 });
                router.navigate(['/login']);
            } else if (err.status === 500) {
                snackBar.open(err.error.message, 'ERROR 500', { duration: 5000 });
            } else {
                snackBar.open(err.error.message, 'ERROR', { duration: 5000 });
            }

            return EMPTY;
        })
    );
};