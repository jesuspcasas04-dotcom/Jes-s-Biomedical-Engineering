package pa.hospital.sinInterfaz;

public class GestionSalaHospital {
	public static void anularReservaSala(SalaVideo sv) {
		sv.anular();
	}
	public static void reservarSala(SalaVideo sv) {
		sv.reservar();
	}
	public static void anularReservaQuirofano(Quirofano qui) {
		qui.anular();
	}
	public static void reservarQuirofano(Quirofano qui) {
		qui.reservar();
	}
}
