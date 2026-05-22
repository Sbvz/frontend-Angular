import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EstadisticasService {

    promedioPonderado(registros: any[]) {

        let suma = 0;
        let creditos = 0;

        registros.forEach(r => {

            suma += r.nota * r.creditos;
            creditos += r.creditos;

        });

        return suma / creditos;

    }

    clasificacion(promedio: number) {

        if (promedio >= 4)
            return "Excelente";

        if (promedio >= 3)
            return "Aprobado";

        return "Reprobado";

    }

    peorAsignatura(registros: any[]) {

        return registros.reduce((min, r) =>
            r.nota < min.nota ? r : min
        );

    }

}