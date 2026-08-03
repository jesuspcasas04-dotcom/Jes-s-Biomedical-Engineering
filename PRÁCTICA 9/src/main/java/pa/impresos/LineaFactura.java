package pa.impresos;

import java.time.LocalDate;

public class LineaFactura {
	private String idCliente;
	private String servicio;
	private LocalDate date;
	private Float importe;
	public LineaFactura(String id, String s, LocalDate ld, Float im) {
		idCliente = id;
		servicio = s;
		date = ld;
		importe = im;
	}
	public String getIdCliente() {
		return idCliente;
	}
	public String getSerivicio() {
		return servicio;
	}
	public LocalDate getDate() {
		return date;
	}
	public Float getImporte() {
		return importe;
	}
}
