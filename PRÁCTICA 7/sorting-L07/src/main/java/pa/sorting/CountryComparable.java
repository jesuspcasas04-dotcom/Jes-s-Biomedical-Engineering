package pa.sorting;


/**
 * Write a description of class Contry here.
 * 
 * @author (your name) 
 * @version (a version number or a date)
 */
public class CountryComparable implements IComparable
{
    // instance variables - replace the example below with your own
    private String name;

    /**
     * Constructor for objects of class Contry
     */
    public CountryComparable(String name)
    {
        // initialise instance variables
        this.name = name;
    }
    
    public String getName() {
        return this.name;
    }

    
    // Country one = new Country("España");
    // Country two = new Country("France");
    // one.esMenorQue(two);
    //		this = one
    // 		i = two    
   @Override
   public boolean esMenorQue(IComparable i) {
	   boolean es = false;
	   CountryComparable c = (CountryComparable) i;
	   if(this.name.compareTo(c.name) < 0) {
		   // "ana".compareTo("platano") < 0
		   // "pana".compareTo("panel") < 0
		   //     x                x

		   es = true;
	   }
	   return es;
   }
}
