/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pa;


public class Enrollment {

    
    public static void main(String[] args) {
    	String [] nombres= {"Mónica Geller","Joe Tribiani", "Chandler Bing", "Rachel Green"};
    	String [] ids= {"A00234", "C22044", "A12003", "B66003"};
    	int [] Creditos= {24,56,6,12};
    	Student[] students= new Student[4];
    	
    	for (int i=0;i<nombres.length;i++) {
    		students[i]= new Student (nombres[i], ids[i]);
    		students[i].addCredits(Creditos[i]);
    	}
    	
    	LabClass Clase1=new LabClass(2);
    	Clase1.setInstructor("Eli");
    	Clase1.setTime("Miercoles,15");
    	Clase1.setRoom("Aulario 2");
    	LabClass Clase2=new LabClass(1);
    	Clase2.setInstructor("Jose Antonio");
    	Clase2.setTime("Miercoles,17");
    	Clase2.setRoom("Aulario 2");
    	
    	for (int i=0; i<students.length; i++) {
    		if (i<=1) {
    			Clase1.enrollStudent(students[i]);
    		}
    		else {
    			Clase2.enrollStudent(students[i]);
    		}
    	}
    	Clase1.printList();
    	Clase2.printList();
    	
    	
    	
    	
    	
    	
    	
    	
        
        
        
        
       
    	
    }
    
}
