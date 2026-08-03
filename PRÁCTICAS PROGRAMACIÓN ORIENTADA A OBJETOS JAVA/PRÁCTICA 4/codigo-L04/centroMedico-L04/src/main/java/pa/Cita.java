/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pa;

/**   Clase que representa una Cita de un paciente con un médico
 */
public class Cita {
    private String idPaciente;
    private String idMedico;
    private String especialidad;
    private String diaConsulta;
    private String horaConsulta;
    
    /**
     * Crea una cita para un paciente con un médico
     * 
     * El constructor inicializa los valores de los atributos:
     * idPaciente, idMedico, especialidad, diaConsulta, horaConsulta
     * 
     * @param paciente nombre del paciente que pide la cita
     * @param medico identificador del médico que atenderá al paciente
     * @param especialidad especialidad del médico que atenderá al paciente
     * @param diaConsulta día de la semana de la cita
     * @param hora hora de la cita
     */
    
    public Cita(String paciente, String medico, String especialidad, String diaConsulta, String hora) {
        this.idPaciente = paciente;
        this.idMedico = medico;
        this.especialidad = especialidad;
        this.diaConsulta = diaConsulta;
        this.horaConsulta = hora;
    }
    
    /**
     * Método que imprime por pantalla los datos de una cita
     */
    public void imprimirCita() {
        System.out.println("------------------------------------");
        System.out.println("Recordatorio de cita");
        System.out.println("Paciente: " + idPaciente);
        System.out.println("Dia consulta: " + diaConsulta);
        System.out.println("Horario: " + horaConsulta);
        System.out.println("Médico: " + idMedico);
        System.out.println("Especialidad: " + especialidad);
        System.out.println("------------------------------------");
    }
    
}
