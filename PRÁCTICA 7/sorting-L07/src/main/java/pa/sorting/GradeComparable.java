package pa.sorting;


/**
 * Write a description of class Grades here.
 * 
 * @author (your name) 
 * @version (a version number or a date)
 */
public class GradeComparable implements IComparable{

    // instance variables - replace the example below with your own
    private double value;

    /**
     * Constructor for objects of class Grades
     */
    public GradeComparable(double grade)
    {
        // initialise instance variables
        value = grade;
    }
/*    
	Grade g1 = new Grade(34);
	Grade g2 = new Grade(53);
	g1.getValue();		this = g1
	g2.getValue()		this = g2
	    

    
*/
    public double getValue() {
        return this.value;
    }
/*
	Grade g1 = new Grade(34);
	Grade g2 = new Grade(53);
		g1.esMenorQue(g2)
    		this = g1
    		i = g2
*/    
    @Override
    public boolean esMenorQue(IComparable i) {
    	boolean es = false;
    	GradeComparable g = (GradeComparable) i;
    	
    	if(value < g.value) {
    		es = true;
    	}
    	return es;
    }
}

