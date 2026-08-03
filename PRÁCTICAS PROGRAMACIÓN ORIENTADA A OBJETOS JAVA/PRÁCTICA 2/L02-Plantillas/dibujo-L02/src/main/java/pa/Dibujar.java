/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pa;


public class Dibujar {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        
    	Circle circulo1=new Circle();
    	Triangle triangulo1= new Triangle();
    	Triangle triangulo2= new Triangle();
    	Square cuadrado1=new Square();
    	Square cuadrado2=new Square();
    	Person persona1=new Person();
    	circulo1.moveVertical(-50);
    	circulo1.makeVisible();
    	circulo1.changeColor("yellow");
    	triangulo1.makeVisible();
    	triangulo1.moveVertical(-80);
    	triangulo1.moveHorizontal(-25);
    	triangulo2.makeVisible();
    	triangulo2.moveHorizontal(140);
    	triangulo2.moveVertical(-80);
    	cuadrado1.makeVisible();
    	cuadrado1.moveHorizontal(5);
    	cuadrado2.makeVisible();
    	cuadrado2.moveHorizontal(-150);
    	persona1.makeVisible();
    	
        
    }
    
}
