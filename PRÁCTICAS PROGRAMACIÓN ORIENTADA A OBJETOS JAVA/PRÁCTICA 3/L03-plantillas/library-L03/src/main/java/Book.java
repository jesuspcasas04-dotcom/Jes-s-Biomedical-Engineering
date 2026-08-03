
/**
 * A class that maintains information on a book.
 * This might form part of a larger application such
 * as a library system, for instance.
 *
 * @author (Insert your name here.)
 * @version (Insert today's date here.)
 */
public class Book
{
    // The fields.
    private String author;
    private String title;
    private int pages;
    private String refNumber;
    private int prestados;

    /**
     * Set the author and title fields when this object
     * is constructed.
     */
    public Book(String bookAuthor, String bookTitle,int pags)
    {
        author = bookAuthor;
        title = bookTitle;
        pags=pages;
        refNumber="";
        
    }

    // Add the methods here ...
    public String getAuthor() {
    	return author;
    }
    public String getTitle() {
    	return title;
    }
    public void setRefNumber(String ref) {
    	if (ref.length()>=3) {
    		ref=refNumber;
    	}
    	else {
    		refNumber="ZZZ";
    	}
    	
    		
    }
    public String getRefNumber() {
    	return refNumber;
    }
    public void prestar () {
    	prestados+=1;
    }
    public int getBorrowed () {
    	return prestados;
    }
    public void mostrarVecesPrestado() {
    	if (prestados>0) {
    		System.out.println("El libro ha sido prestado " + prestados + " veces");
    	}
    	else {
    		System.out.println("El libro no ha sido prestado ninguna vez");
    	}
    	
    }
    public void printDetails() {
    	if(refNumber!="ZZZ") {
    		System.out.println("Detalles de " + title);
    		System.out.println("--------------------------------");
    		System.out.println("Autor: " + author);
    		System.out.println("Titulo: " + title);
    		System.out.println("Nº de referencia: " + refNumber);
    		System.out.println("Nº de préstamos: " + prestados);
    	}
    	else {
    		System.out.println("ERROR: El número de referencia del libro Juego de Tronos debe contener al menos 3 caracteres");
    		System.out.println("Detalles de " + title);
    		System.out.println("--------------------------------");
    		System.out.println("Autor: " + author);
    		System.out.println("Titulo: " + title);
    		System.out.println("Nº de referencia: " + refNumber);
    		System.out.println("Nº de préstamos: " + prestados);
    		
    	}
    	
    }
}
