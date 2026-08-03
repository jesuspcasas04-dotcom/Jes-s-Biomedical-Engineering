package pa.hospital.sinInterfaz;

public class Quirofano {
	private String id;
	public Quirofano(String _id) {
		id = _id;
	}
	public String getId() {
		return id;
	}
	public void anular() {
		System.out.println("anulando reserva de quirofano " + id);
	}
	public void reservar() {
		System.out.println("Reservando quirofano " + id);
	}
}
