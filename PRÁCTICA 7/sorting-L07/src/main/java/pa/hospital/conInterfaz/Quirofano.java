package pa.hospital.conInterfaz;

public class Quirofano implements IReservable{
	// Atributo de instancia: cuando creas un objeto dentro cada objeto habra un id, cada uno tiene su propio id.
	private String id;
	
	// Atributo de clase: Es una variable compartida por todos los objetos de la clase, solo hay una,
	// todos modifican y consultan la misma variable.
	// Quirofano.nextId  existe incluso antes de haber creado ningun objeto.
	private static int nextId = 0;
	public Quirofano() {
		id = "Quirofano" + nextId;
		nextId++;
	}
	public String getId() {
		return id;
	}
	@Override
	public void anular() {
		System.out.println("anulando reserva de quirofano " + id);
	}
	@Override
	public void reservar() {
		System.out.println("Reservando quirofano " + id);
	}
}
