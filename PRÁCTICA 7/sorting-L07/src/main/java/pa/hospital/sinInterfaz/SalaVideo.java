package pa.hospital.sinInterfaz;

public class SalaVideo {
	private int id;
	public SalaVideo(int _id) {
		id = _id;
	}
	public int getId() {
		return id;
	}
	public void anular() {
		System.out.println("Anulando reserva sala de video " + id);
	}
	public void reservar() {
		System.out.println("Reservando sala de video " + id);
	}
}
