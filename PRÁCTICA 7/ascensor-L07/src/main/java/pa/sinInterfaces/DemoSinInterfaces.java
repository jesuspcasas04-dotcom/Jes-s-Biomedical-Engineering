/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pa.sinInterfaces;

import java.util.ArrayList;

import pa.Peticion;

/**
 * Clase que contiene el método main
 * 
 * @author eli
 */
public class DemoSinInterfaces {

    
    public static void main(String[] args) {
             
       int num_peticiones, num_peticiones_con_avisos;
      
       /* ejemplos de PETICIONES:
          -8  22  15  0  7  10  2  6  1  A
           0   3   3  3  4  A
           3   2   3  0  0  A
           1    0   3  -2  17   17 A
           3    3   5   5   3 A
           1    1   1   1  10   12 A
           5    7 A
           A              //termina el programa
           -8 -5  33  A   //termina el programa
        */
       
       // Version sin interfaces
       
       Ascensor ascensor = new Ascensor(); 
       do {
    	   num_peticiones= ascensor.leer_peticiones();
	       num_peticiones_con_avisos = ascensor.seleccionar_peticiones_validas();
	       ascensor.llevar_personas_a_sus_destinos();
       }  while (num_peticiones!= num_peticiones_con_avisos);
       
       System.out.println("\nAscensor inactivo.");      
    }
    
}
