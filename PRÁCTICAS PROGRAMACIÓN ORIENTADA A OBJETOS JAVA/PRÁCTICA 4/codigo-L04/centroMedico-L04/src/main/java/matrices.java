
import java.util.Random;
import java.util.Scanner;
public class matrices {
	public static void main(String[] args) {
		int NUMFILAS,NUMCOLUMNAS;
		Scanner sc=new Scanner(System.in);
		System.out.print("Introduce el numero de filas: ");
		NUMFILAS=sc.nextInt();
		System.out.print("Introduce el numero de columnas: ");
		NUMCOLUMNAS=sc.nextInt();
		int [][] matriz= new int [NUMFILAS][NUMCOLUMNAS];
		for (int i=0;i<NUMFILAS;i++ ) {
			for (int j=0;j<NUMCOLUMNAS;j++) {
				System.out.printf("%4d",matriz[i][j]);
			}
			System.out.println();
			
		}
		System.out.println();
		System.out.println();
		System.out.println();
		Random r=new Random();
		for (int i=0;i<NUMFILAS;i++) {
			for(int j=0;j<NUMCOLUMNAS;j++) {
				matriz[i][j]=r.nextInt(10);
				System.out.printf("%4d",matriz[i][j]);
			}
			System.out.println();
		
		
		
		
	}
		//Imprime la suma de la fila seleccionada:
		int filaseleccionada;
		
		
		System.out.print("Introduce la fila deseada: ");
		filaseleccionada=sc.nextInt();
		for (int i=0;i<=NUMFILAS;i++) {
			int suma=0;
			if (i==filaseleccionada) {
				for (int j=0;j<NUMCOLUMNAS;j++) {
					suma+=matriz[filaseleccionada-1][j];
				}
				System.out.println(suma);
			}
			
		}
		//Imprime el minimo valor de la fila matriz
		int minvalor;
		minvalor=matriz[filaseleccionada-1][0];
		for (int columna=1;columna<matriz[filaseleccionada-1].length;columna++) {
			
			if (matriz[filaseleccionada-1][columna]<minvalor) {
				minvalor=matriz[filaseleccionada-1][columna];
				
			}
			
			
			
		}
		System.out.println("El valor mínimo en la fila seleccionada es: " + minvalor);
		
		
		
		//Pide un elemento a buscar en una fila
		int valorBuscado;
		System.out.print("Introduce el valor a buscar: ");
		valorBuscado=sc.nextInt();
		for(int columna=0;columna<NUMCOLUMNAS;columna++) {
			if(matriz[filaseleccionada-1][columna]==valorBuscado) {
				System.out.println("El valor buscado está en la posición "+ (columna+1) + " de la fila " + filaseleccionada);
			}
			
		}
		
		

}
}