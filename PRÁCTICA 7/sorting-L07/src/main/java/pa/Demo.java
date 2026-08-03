package pa;
import pa.sorting.CountryComparable;
import pa.sorting.GradeComparable;
import pa.sorting.Sort;

public class Demo {
	public static void main(String args []) {
		// IComparable []
		//    ^
		//	  |
		// CountryComparable []
		
		CountryComparable []	paises = {
				new CountryComparable("españa"),
				new CountryComparable("androrra"),
				new CountryComparable("italia"),
				new CountryComparable("rumania")
		};
		Sort.selectionSortI(paises);
		for(CountryComparable cc : paises) {
			System.out.println(cc.getName());
		}
		
		GradeComparable [] 		grades = {
			new GradeComparable(23),
			new GradeComparable(49),
			new GradeComparable(341)
		};
		System.out.println("-----");
		Sort.selectionSortI(grades);
		for(GradeComparable gc : grades) {
			System.out.println(gc.getValue());
		}
	}
}
