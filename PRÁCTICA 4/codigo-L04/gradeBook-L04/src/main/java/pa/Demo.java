package pa;
import java.util.Random;

public class Demo {

	public static void main(String[] args) {
		
		Random dom=new Random();
		int tam=dom.nextInt(100);
		int [] grados=new int [tam];
		Random random=new Random();
		for (int i=0;i<tam;i++) {
			grados[i]= random.nextInt(0,100);
		}
		GradeBook gradebook=new GradeBook("Matemáticas", grados);
		System.out.println(gradebook.GetAverage());
		gradebook.GetMaximun();
		gradebook.getMinimun();
		gradebook.processGrades();
		

	}

}
