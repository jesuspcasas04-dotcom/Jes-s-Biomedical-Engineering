package pa;

public class meinPetision {
	public static void main(String [] args) {
		// Es la misma para todos los objetos.
		System.out.println(Peticion.next_id); // 0
		// Es que la variable de clase ya existe
		// incluso antes de crear ningun objeto porque no
		// esta vinculada a ningun objeto, todos los objetos
		// compartiran esa variable.
		
		Peticion p1 = new Peticion(2);
			// p1.id = 0
			// Peticion.next_id = 1
		Peticion p2 = new Peticion(5);
			// p2.id = 1
			// Peticion.next_id = 2
		
		System.out.println(Peticion.next_id); // 2
		
		// son atributos de instancia cada objeto
		// tiene su propio id y su propio piso destino
		// pero todos comparten la variable Peticion.nextId
		System.out.println(p1.getId()); // 0
		System.out.println(p2.getId()); // 1
		System.out.println(p1.next_id); // 2
		System.out.println(p2.next_id); // 2
		System.out.println(Peticion.next_id); // 2
		
		// No tiene / necesita objeto invocante, no hay this
		// 
		System.out.println(Peticion.get_next_id()); // 2
		// se ignora a p1...
		System.out.println(p1.get_next_id());
	}
}
