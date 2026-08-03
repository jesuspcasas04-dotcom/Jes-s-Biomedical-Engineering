package pa.sorting;
/**
 * Write a description of class Sort here.
 * 
 * @author (your name) 
 * @version (a version number or a date)
 */
public class Sort  {
   /**
      Sorts an array of int elements, using selection sort.
      @param a the array to sort
      
      Utiliza el algoritmo de selccion directa:
      
      
      i
      0		1		2		3		4		5
      ---------------------------------------
      5		9		2		8		4		7		minPos = 2
      x				x

            i
      0		1		2		3		4		5
      ---------------------------------------
      2		9		5		8		4		7		minPos = 4
      		x						x
      		
      		
            		i
      0		1		2		3		4		5
      ---------------------------------------
      2		4		5		8		9		7		minPos = 2
      				x
      				x
      				
            				i
      0		1		2		3		4		5
      ---------------------------------------
      2		4		5		7		9		8		minPos = 5
      						x				x
      						

      						        i
      0		1		2		3		4		5
      ---------------------------------------
      2		4		5		7		9		8		minPos = 5
      								x		x


      										i
      0		1		2		3		4		5
      ---------------------------------------
      2		4		5		7		8		9
      										
      

			a		b		aux
			------------------------------------
			4		2		4			aux = a
			2		2		4			a = b
			2		4		4			b = aux

      
   */
   public static void selectionSort(int[] a)
   {   
      for (int i = 0; i < a.length - 1; i++){  
         int minPos = minimumPosition(a, i);
         //intercambiamos los elementos de la posición minPos e i
         int temp = a[minPos];
         a[minPos] = a[i];
         a[i] = temp;
         
      }
      
   }
   /**
      Finds the smallest element in a tail range of the array.
      @param a the array to sort
      @param from the first position in a to compare
      @return the position of the smallest element in the
      range a[from] . . . a[a.length - 1]
   
 
	Devuelve la posicion del elemento mas pequeño desde la posicion que le pasas hasta el final del vector.

		 0  1  2  3  4  5
 	a = {9, 8, 3, 5, 6, 20}
 	
 		minimumPosition(a, from = 0)
		
				from		minPos		i
				-----------------------------
				0			0			1
				------------------------------
				0			1			2			a[1] < a[0]
				------------------------------
				0			2			3			a[2] < a[1]
				------------------------------
				0			2			4
				------------------------------
				0			2			5
				------------------------------
				0			2			6
				------------------------------
   */
   private static int minimumPosition(int[] a, int from)  {  
      int minPos = from;
      for (int i = from + 1; i < a.length; i++) {
         if (a[i] < a[minPos]) { minPos = i; }
      }
      return minPos;
   }


   private static int minimumPositionI(IComparable [] a, int from)  {  
	      int minPos = from;
	      for (int i = from + 1; i < a.length; i++) {
	         //if (a[i] < a[minPos]) { minPos = i; }
	    	  if(a[i].esMenorQue(a[minPos])) {minPos = i;}
	      }
	      return minPos;
   }
   public static void selectionSortI(IComparable [] a){   
      for (int i = 0; i < a.length - 1; i++){  
         int minPos = minimumPositionI(a, i);
         //intercambiamos los elementos de la posición minPos e i
         IComparable temp = a[minPos];
         a[minPos] = a[i];
         a[i] = temp;
         
      }
      
   }


}




