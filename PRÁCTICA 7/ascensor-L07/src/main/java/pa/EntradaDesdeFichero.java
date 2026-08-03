package pa;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class EntradaDesdeFichero  {
	private int linea_actual;
	private String ruta_fichero;
	private int num_lineas_fichero;
	
	
	public EntradaDesdeFichero() {
		linea_actual = 0;
		ruta_fichero="src/main/resources/peticiones-fichero.txt";
		try {
            num_lineas_fichero = Files.readAllLines(Paths.get(ruta_fichero)).size();     
        } catch (IOException ex) {
            ex.printStackTrace();
        }
		
	}
	
	@Override
    public int[] obtenerDatos() {
		
		/* The method Files.readAllLines returns a list of all lines 
		 * of the file as strings, where each string corresponds to one line. 
		 * with get(lineIndex) you get the desired nth line back and only have 
		 * to parse the strings to integers.
		 */
    	
		int[] resultado;
    	List<Integer> datos = new ArrayList<>();
    	if (linea_actual < num_lineas_fichero) {
	        try {
	            String linea = Files.readAllLines(Paths.get(ruta_fichero)).get(linea_actual);
	            datos = Pattern.compile("\\s+")
	                    .splitAsStream(linea)
	                    .map(Integer::parseInt)
	                    .collect(Collectors.toList());
	        } catch (IOException ex) {
	            ex.printStackTrace();
	        }
	    	linea_actual++;
			resultado = new int[datos.size()];
			for (int i=0; i< datos.size(); i++) {
				resultado[i]= datos.get(i);
			}
    	} else resultado=new int[0];	
    	
    	System.out.print("  Peticiones leidas: [");
    	for (int i=0; i<(resultado.length-1); i++) {
    		System.out.print(" "+resultado[i]+", ");
    	}
    	System.out.println(" "+resultado[resultado.length-1]+" ]");
		
		return resultado;		
    }

}
