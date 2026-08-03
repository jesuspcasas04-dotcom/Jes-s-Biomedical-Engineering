package pa;

import Book;

public class Prueba {
	public static void main(String[] args) {
		Book libro1= new Book ("George R.R. Martin","Juego de Tronos",1300);
		Book libro2= new Book ("Umberto Eco","El nombre de la rosa",987);
		Book libro3= new Book ("Chistian Jacq","Tutankamon",876);
		System.out.println("--Creados los 3 libros--");
		
		libro1.setRefNumber("01");
		libro2.setRefNumber("001");
		libro3.setRefNumber("0003");
		libro1.prestar();
		libro1.prestar();
		libro2.prestar();
		
		libro1.printDetails();
		libro2.printDetails();
		libro3.printDetails();
		libro1.setRefNumber("0001");
		libro2.setRefNumber("0002");
		libro1.printDetails();
		libro2.printDetails();
		libro1.mostrarVecesPrestado();
		libro2.mostrarVecesPrestado();
		libro3.mostrarVecesPrestado();
		
		
		}
		
	}


