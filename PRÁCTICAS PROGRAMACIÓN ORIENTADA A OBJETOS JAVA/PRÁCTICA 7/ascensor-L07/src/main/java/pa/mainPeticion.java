package pa;

import java.util.ArrayList;
import java.util.Scanner;

public class mainPeticion {
	public static void main(String [] args) {
		Scanner lector_peticiones = new Scanner(System.in);
		int valor;
		Peticion leida;
		ArrayList<Peticion> peticiones = new ArrayList<>();
		
		System.out.print("Introduce A para acabar: ");
		do {
			valor = lector_peticiones.nextInt();
			System.out.println("he leido " + valor);
			leida = new Peticion(valor);
			peticiones.add(leida);
		}while(lector_peticiones.hasNextInt());
		lector_peticiones.nextLine(); // leo todo lo que queda y lo ignoro.
		
		System.out.println(peticiones);
		
		// invoco al metodo con el nombre de la clase.
		System.out.println(Peticion.next_id); // 1
		System.out.println(Peticion.get_next_id());

		Peticion p = new Peticion(12); // Peticion.next_id = 2
		// System.out.println(p.get_next_id()); la referencia que hay en p se esta ignorando, porque el metodo de clase no recibe objeto invocador.
		Peticion p2 = new Peticion(14); // Peticion.next_id = 3
		
		System.out.println("Objetos creados: " + (p.get_next_id() - 1)); // 3
		System.out.println(p.get_id() + ", " + p.get_piso_destino()); // p.id = 1
		System.out.println(p2.get_id() + ", " + p2.get_piso_destino());// p2.id = 2
	
	}
}
