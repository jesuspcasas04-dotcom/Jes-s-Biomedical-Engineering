package pa.hospital.conInterfaz;

public class GestionSalaHospital {
	public static void anularReserva(IReservable res) {
		res.anular();
	}
	public static void reservar(IReservable res) {
		res.reservar();
	}
}
