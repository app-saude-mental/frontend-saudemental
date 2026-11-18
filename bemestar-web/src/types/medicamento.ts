export interface Medicamento {
  id: number;
  nome: string;
  dosagem: string;
  horas: string; // "08:00"
}

// o mesmo corpo serve para criar (POST) e editar (PUT)
export interface MedicamentoRequest {
  nome: string;
  dosagem: string;
  horas: string; // "HH:mm"
}
