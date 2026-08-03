package pa;

import pa.hospital.conInterfaz.GestionSalaHospital;
import pa.hospital.conInterfaz.IReservable;
import pa.hospital.conInterfaz.Quirofano;
import pa.hospital.conInterfaz.SalaVideo;

public class DemoHospital {
	public static void main(String [] args) {
		IReservable [] qui = new IReservable [15];
		
		for(int i = 0; i < 10; i++) {
			qui[i] = new Quirofano();
		}
		for(int i = 10; i < 15; i++) {
			qui[i] = new SalaVideo();
		}
		
		for(IReservable i : qui) {
			GestionSalaHospital.reservar(i);
		}
	}
}
