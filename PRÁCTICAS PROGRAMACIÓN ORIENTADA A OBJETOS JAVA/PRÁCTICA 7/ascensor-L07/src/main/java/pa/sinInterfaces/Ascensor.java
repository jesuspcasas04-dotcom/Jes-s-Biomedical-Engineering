package pa.sinInterfaces;

import java.util.ArrayList;
import java.util.Scanner;

import pa.Peticion;


/**
 * Un ascensor tendrá los siguientes atributos:
 * - peticiones: es una colección ilimitada de objetos de tipo Peticion, y contiene todas las peticiones
 * de los usuarios que hay en la planta en la que el ascensor se ha detenido y a abierto sus puertas.
 * - peticiones_validas: es una colección ilimitada de objetos de tipo Petición, y contiene las peticiones
 * válidas (son las peticiones de las personas que finalmente subirán al ascensor)
 * - piso_actual: es un entero que representa el piso en el que se encuentra actualmente el ascensor
 * - lector_peticiones: de tipo Scanner, usaremos este objeto para leer los pisos de destino de las personas
 * que están esperando para subir al ascensor.
 * - IMPORTANTE: el ascensor puede recorrer un náximo de 20 pisos, y puede llevar a 4 personas como máximo.
 */
public class Ascensor {
	private final static int KPISOS = 20;
	private final static int KPERSONAS = 4;
	//declaración de atributos. Son todos privados.
	private ArrayList<Peticion> peticiones;
	private ArrayList<Peticion> validas;
	private int piso_actual;
	private Scanner lector_peticiones;
	
	public Ascensor() {
		piso_actual = 0;
		peticiones = new ArrayList<>();
		validas = new ArrayList<>();
		lector_peticiones = new Scanner(System.in);
	}

	
	/**
	 * El método nuevo_aviso recibe una petición NO VALIDA por parámetro
	 * y UNA CADENA CON LOS AVISOS ACTUALES, y devuelve UNA NUEVA CADENA DONDE SE AÑADIDO A LA CADENA
	 * ANTERIOR EL NUEVO AVISO CORRESPONDIENTE A LA PETICION RECIBIDA cuyo valor dependerá de:
	 * a) si es una petición válida pero ya está el ascensor lleno, el mensaje será:
	 *    "- El usuario que ha pulsado X ya no cabe\n" (siendo X el número de piso de destino)
	 * b) si es una petición con un valor de piso de destino incorrecto (fuera del rango de
	 *    pisos que puede recorrer el ascensor, el mensaje será:
	 *    "- El usuario que ha pulsado X ha introducido un valor incorrecto\n"
	 * c) si el usuario ya está en la planta a la que ha solicitado ir, el mensaje será:   
	 *    "- El usuario que ha pulsado X ya está en esa planta\n"
	 * El mensaje de error de cada petición será una línea de texcto que se concatenará con los mensajes 
	 * de invocaciones previas     
	 */
	private String nuevo_aviso(Peticion p, String MSG) {
		if(p.get_piso_destino() >= 0 && p.get_piso_destino() <= KPISOS) {
			if(validas.size() == KPERSONAS) { // validas.size() => peticiones validas consideradas hasta el momento (solo podemos 4 peticiones)
				MSG += "- El usuario que ha pulsado " + p.get_piso_destino() + " ya no cabe\n";
			}
			else {
				if(p.get_piso_destino() == piso_actual) {
					MSG += "- El usuario que ha pulsado " + p.get_piso_destino() + " ya esta en esa planta\n";
				}
			}
		}
		else {
			MSG = MSG +  "- El usuario que ha pulsado " + p.get_piso_destino() + " ha introducido un valor incorrecto\n";
		}
		
		return MSG;
	}
	
	/**
	 * El método leer_peticiones usa la clase Scanner para leer los números de piso
	 * a los que quieren ir cada una de las personas. Dichos valores los introducirá el usuario
	 * por teclado. Los números de piso de destino serán enteros. Para poder deteminar el 
	 * final la entrada, usaremos el carácter 'A', que incluiremos al final.
	 * Por ejemplo: 3 5 10 12 A
	 *              representan las peticiones 3, 5, 10 y 12.
	 * 	
	 */
	public int leer_peticiones() {
		int valor;
		Peticion leida;
		System.out.println("\n---------------------------------");
		System.out.println("Estoy en el piso: " + piso_actual); //aquí añadiremos el piso_actual);
		System.out.println("Puertas abiertas. Espero peticiones: ");
		
		//aquí leemos los pisos de destino. Usaremos los métodos hasNextInt() y nextInt() de la clase Scanner
		//para cada dato leido crearemos el objeto Peticion correspondiente, y lo añadiremos a la lista
		//de peticiones del ascensor.
		
		while(lector_peticiones.hasNextInt()){ // se queda esperando hasta que metas algo en el buffer.
			valor = lector_peticiones.nextInt();
			// nextInt lee un entero del buffer y lo elimina del buffer.
			leida = new Peticion(valor);
			peticiones.add(leida);
		};
		// System.out.println(peticiones); // llama al toString de cada uno de los objetos que contiene!!! jadasdf
		//usaremos el método nextLine() cuando ya no queden enteros por leer, de esta forma
		//"leeremos" el carácter 'A' y el retorno de carro
		lector_peticiones.nextLine();
		
		return peticiones.size(); //aquí devolveremos el número de peticiones que hemos leído	
	}
	
	/**
	 * Este método analiza todas y CADA UNA de las peticiones de la lista peticiones,
	 * de forma que:
	 * - una petición será válida si el piso de destino está dentro del rango de pisos 0..20 y
	 * 	 el piso de destino es diferente al piso actual.
	 * - si la petición es válida, y la persona cabe en el ascensor, entonces dicha petición se añade
	 *   a la lista peticiones_validas
	 * - si la petición no es válida, entonces se genera un nuevo aviso mensaje de aviso, que se
	 * 	 añade (concatena) a los avisos de peticiones anteriores.
	 * - cada petición, una vez analizada para ver si es válida o no, se borra de la lista de peticiones.
	 * 
	 * El método, después seleccionar las peticiones válidas y obtener la lista peticiones_validas
	 * mostrará por pantalla el mensaje:
	 * "Entran en el ascensor las personas que van a los pisos: x, y, z, ...", en donde x, y, z, ...
	 * son los pisos de destino, separados por comas, de las personas que finalmente entran en el 
	 * ascensor (como máximo serán 4)
	 * 
	 * Si hay peticiones no válidas, el método imprime por pantalla:
	 * "AVISOS" + todos los avisos asociados a cada petición no válida, y que estarán almacenados
	 * en una variable de tipo String. (ver traza de ejecución)
	 * 
	 * El método devuelve el número de avisos que se han generado, que serán tantos como peticiones
	 * no válidas haya
	 */
	public int seleccionar_peticiones_validas () {
		String avisos = ""; //aquí vamos concatenando todos los avisos de todas las peticiones no válidas
		int c = 0;
		// metemos las peticiones validas en validas.
		while(!peticiones.isEmpty()) {
			Peticion p = peticiones.get(0);
			if(p.get_piso_destino() >= 0 && p.get_piso_destino() <= KPISOS &&  p.get_piso_destino() != piso_actual && validas.size() <= KPERSONAS) {
				validas.add(p);
			}
			else {
				c++;
				avisos = nuevo_aviso(p, avisos);
			}
			peticiones.remove(0);
		}
		System.out.println(avisos);
		return c;  //devolvemos el número de avisos (peticiones no válidas)
	}	
	
	/**
	 * Este método pone en marcha el ascensor para llevar a cada uno de sus ocupantes a los
	 * pisos de destino que han solicitado, las cuales serán las peticiones de la lista
	 * peticiones_validas. 
	 * 
	 * El método imprime el mensaje: "Cerrando puertas. Estamos en el piso: X", siendo X
	 * el piso actual en el que se encuentra el ascensor.
	 * Las peticiones se van antendiendo de una en una, y PARA CADA petición:
	 * - si se solicita ir a un piso más alto que el actual, se mostrará el mensaje:
	 *     "Subiendo a una persona la planta Y" (siendo Y la planta de destino solicitada
	 * - si se solicita ir a un piso inferior al actual, se mostrará el mensaje:
	 *     "Bajando a una persona la planta Y" 
	 * - si la petición anterior a la actual ha solicitado la misma planta, entonces se 
	 *   mostrará el mensaje: 
	 *    "La siguiente persona también puede bajar"  
	 * - Después de procesar CADA petición, ésta se ELIMINARÁ de la lista peticiones_validas
	 * - El ascensor actualizará su posición actual cada vez que suba o baje a la planta de destino.        
	 */
	public void llevar_personas_a_sus_destinos() {	
		System.out.println(validas.size());
		while(!validas.isEmpty()) {
			Peticion p = validas.get(0);
			if(p.get_piso_destino() > piso_actual) {
				System.out.println("subiendo a la persona al piso " + p.get_piso_destino());
			}
			else {
				if(p.get_piso_destino() < piso_actual) {
					System.out.println("bajando a la persona al piso "  + p.get_piso_destino());
				}
				else {
					System.out.println("la persona " + p.get_piso_destino() + " tambien puede bajar");
				}
			}
			piso_actual = p.get_piso_destino();
			validas.remove(0);
		}
	}
}



