package pa;

/**
 * Cada petición se caracteriza por un piso de destino (piso_destino) y un identificador (id),
 * ambos de tipo entero. Los valores de los dos atributos NO se podrán cambiar, pero sí consultar.
 * En el caso del identificador, su valor no se pasará como parámetro en el constructor, sino que 
 * se asignará automáticamente, comenzando con el valor 0, y cada nueva petición verá incrementado 
 * en 1 su valor de id.
 */
public class Peticion {
	//los atributos se llamarán "piso_destino" e "id" y son privados.
	public static int next_id = 0;
	private final int id;
	private final int piso_destino;
	public Peticion(int pd) {
		piso_destino = pd;
		id = next_id;
		next_id++;
	}
	public int getId() {
		// this apunta al objeto que invoco al metodo
		return id;
	}
	public static int get_next_id() {
		// NO HAY THIS EN LOS METODOS ESTATICOS
		// System.out.println(this.id);
		return next_id;
	}
	public int get_piso_destino() {
		return piso_destino;
	}
	@Override
	public String toString() {
		// return this;
		return "id=" + id + ", piso destino = " + piso_destino;
	}
}

