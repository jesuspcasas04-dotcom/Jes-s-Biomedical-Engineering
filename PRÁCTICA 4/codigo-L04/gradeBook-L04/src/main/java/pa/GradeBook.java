package pa;


public class GradeBook {
	private String Coursename;
	private int[] grades;
	private int maximo;
	private int minimo;
	private double media;
	private double suma;
	private int numfilas;
	private int contador;
	
	public GradeBook(String Curso,int[] grados) {
		Coursename=Curso;
		grades=grados;
	}
	public void SerCourseName(String Course) {
		Coursename=Course;
	}
	public String GetCourseName() {
		return Coursename;
		
		
	}
	public int GetMaximun() {
		maximo=grades[0];
		for (int i=0;i<grades.length;i++) {
			if (grades[i]>maximo) {
				maximo=grades[i];
			}
		}
		return maximo;
	}
	public int getMinimun() {
		minimo=grades[0];
		for (int i=0;i<grades.length;i++) {
			if (grades[i]<minimo) {
				minimo=grades[i];
			}
		}
		return minimo;
	}
	public double GetAverage() {
		int i=0;
		while (i<grades.length){
			suma+=grades[i];
			i++;
		}
		media=suma/grades.length;
		
		return media;
	}
	public void printBarChart() {
		System.out.println("Histograma de notas de la signatura: "+ Coursename);
		for (int i=0;i<100;i+=10) {
			System.out.print(i + "-" + (i+9) + ": ");
			for(int j=0;j<grades.length;j++) {
				if (grades[j]>=i && grades[j]<=(i+9)) {
					System.out.print("*");
				}
			}
			System.out.println();
			
		
		
	}
	}
	public void pritGrades() {
		System.out.println("Listado de notas de la asignatura: "+ Coursename);
		for(int i=0;i<grades.length;i++) {
			System.out.print(grades[i] + ",");
			if ((i+1)%5==0) {
				System.out.println();
			}
		}
		
	}
	public void processGrades(){
		System.out.println("Listado de notas de la asignatura: "+ Coursename);
		for(int i=0;i<grades.length;i++) {
			System.out.print(grades[i] + " ");
			if ((i+1)%5==0) {
				System.out.println();
			}
		}
		System.out.println();
		System.out.printf("Nota media: "+ media);
		System.out.println();
		System.out.println();
		System.out.println("Intervalo de nota mínima,máxima: [" + minimo + "," + maximo + "]");
		System.out.println();
		System.out.println("Histograma de notas de la signatura: "+ Coursename);
		for (int i=0;i<100;i+=10) {
			System.out.print(i + "-" + (i+9) + ": ");
			for(int j=0;j<grades.length;j++) {
				if (grades[j]>=i && grades[j]<=(i+9)) {
					System.out.print("*");
				}
			}
			System.out.println();
			
		
		
	}
	
	
	

}
}
