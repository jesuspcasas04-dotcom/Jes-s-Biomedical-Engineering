package pa.hospital.conInterfaz;

public class SalaVideo implements IReservable{
	private int id;
	private static int nextId = 100;
	public SalaVideo() {
		id = nextId;
		nextId++;
	}
	public int getId() {
		return id;
	}
	@Override
	public void anular() {
		System.out.println("Anulando reserva sala de video " + id);
	}
	@Override
	public void reservar() {
		System.out.println("Reservando sala de video " + id);
	}
}
