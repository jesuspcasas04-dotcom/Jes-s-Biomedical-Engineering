package pa;

public class Prueba {

	public static void main(String[] args) {
		Medico medico1=new Medico("001","Oftalmólogo");
		System.out.println("Iniciamos el proceso de reserva de citas...");
		medico1.reservarCita(2,"mañana","Pedro");
		medico1.reservarCita(2,"mañana","María");
		medico1.reservarCita(2,"mañana","Lucas");
		medico1.reservarCita(2,"mañana","Ana");
		medico1.reservarCita(3,"otro","Matías");
		medico1.reservarCita(8,"tarde","Eva");
		medico1.reservarCita(4,"tarde","Carlos");
		
		medico1.printHorario();

	}

}
