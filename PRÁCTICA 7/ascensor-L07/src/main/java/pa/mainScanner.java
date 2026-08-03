package pa;
import java.util.ArrayList;
import java.util.Scanner;
public class mainScanner {
	public static void main(String [] args) {
		Scanner sc = new Scanner(System.in);
		int valor;
		Peticion p;
		ArrayList<Peticion> peticiones = new ArrayList<>();
		
		System.out.print("Introduce A para finalizar: ");
		while(sc.hasNextInt()){ // se queda esperando hasta que metas algo en el buffer.
			valor = sc.nextInt();
			// nextInt lee un entero del buffer y lo elimina del buffer.
			p = new Peticion(valor);
			peticiones.add(p);
		};
		System.out.println(peticiones); // llama al toString de cada uno de los objetos que contiene!!! jadasdf
		sc.nextLine(); // "A 3 f a" y lo ignro
	}
}
