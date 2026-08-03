// de instancia / de clase (static)
// 	una para cada objeto / una compartida por todos los objetos

// constante (final)s / variable
//	no puede cambiar de valor / que puede cambiar de valor..


package pa.impresos;
import java.time.LocalDate;
import java.util.ArrayList;
public class Factura {
	public static final int KMAXLINEAS = 6;
	private static int ultimoID = 1;
	private final int id;
	private LocalDate fecha;
	private String cliente;
	private ArrayList<LineaFactura> lineas;
	private Float total;
	public Factura(String c) {
		id = ultimoID;
		ultimoID++;
		cliente = c;
		lineas = new ArrayList<>();
		total = 0.0f;
		fecha = LocalDate.now();
	}
	public ArrayList<LineaFactura> getLineas(){
		return lineas;
	}
	public int getId() {
		return id;
	}
	public LocalDate getFecha() {
		return fecha;
	}
	public String getCliente() {
		return cliente;
	}
	public Float getFloat() {
		return total;
	}
	public int addLinea(LineaFactura lf) {
		int p = -1;
		if(lineas.size() < KMAXLINEAS) {
			total += lf.getImporte();
			lineas.add(lf);
			p = lineas.size();
		}
		return p;
	}
	
	
}
