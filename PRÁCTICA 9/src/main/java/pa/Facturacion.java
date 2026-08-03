package pa;
import java.io.Console;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;

import pa.impresos.Factura;
import pa.impresos.LineaFactura;

/*
	
	Factura: id1, cliente1
		LineaFactura: cliente1 100
		LineaFactura: cliente1 200
		LineaFactura: cliente1 300
	
	Factura: id2, cliente2
		LineaFactura: cliente2 100
		LineaFactura: cliente2 200
		LineaFactura: cliente2 300
		
		
		
	lista:
		LineaFactura: cliente1 100
		LineaFactura: cliente2 100
		LineaFactura: cliente2 200
		LineaFactura: cliente1 200
		LineaFactura: cliente1 300
		LineaFactura: cliente2 300

Insertar o actualizar:
	* Busca si el cliente de la linea ya tiene creada factura
		- si tiene creada una factura
			le añado la linea a la factura
		- si no tiene creada la factura
			crea una factura
			le añada la linea a la factura recien creada
 */

public class Facturacion {
	private ArrayList<Factura> listaFacturas;
	public Facturacion() {
		listaFacturas = new ArrayList<Factura>();
	}	
	public ArrayList<Factura> getFacturas(){
		return listaFacturas;
	}
	public Factura buscarFactura(String n) {
		Factura f = null;
		int i;
		i = 0;
		while(i < listaFacturas.size() && f == null) {
			if(listaFacturas.get(i).getCliente().equals(n)) {
				f = listaFacturas.get(i);
			}
			else {
				i++;
			}	
		}
		return f;
	}
	public void generarFacturas(ArrayList<LineaFactura> lf) {
		Factura f = null;
		for(LineaFactura linea : lf) {
			f = buscarFactura(linea.getIdCliente());
			if(f != null) {
				f.addLinea(linea);
			}
			else {
				f = new Factura(linea.getIdCliente());
				f.addLinea(linea);
				listaFacturas.add(f);
			}
		}
	}
	public boolean login() {
		boolean b = false;
		char [] passValue = {'F', 'a', 'c', 't', 'u', 'r', 'a', 'c', 'i', 'o', 'n'};
		String loginValue = "Facturacion";
		
		String login;
		char [] password;
		Console c = System.console();
		if(c != null) {
			login = c.readLine("Enter your login: ");
			password = c.readPassword("Enter your password: ");
			if(Arrays.equals(password, passValue) && loginValue.equals(login)) {
				c.writer().println("Valid credentils");
				b = true;
			}
			else {
				c.writer().println("Invalid login or password");
			}
		}
		else {
			System.out.println("Console not avalaible");
		}
		
		return b;
	}
	public static void main(String [] args) {
		Facturacion f = new Facturacion();
		if(f.login()) {
			ArrayList<LineaFactura> lineas = new ArrayList<LineaFactura>();
			ArrayList<LineaFactura> lista;
			lineas.add(new LineaFactura("juan", "cositas", LocalDate.now(), 100.0f));
			lineas.add(new LineaFactura("quico", "minibar", LocalDate.now(), 12000.0f));
			lineas.add(new LineaFactura("quico", "rule", LocalDate.now(), 10020.0f));
			lineas.add(new LineaFactura("juan", "mas cositas", LocalDate.now(), 13000.0f));
			lineas.add(new LineaFactura("quico", "navidad", LocalDate.now(), 1000.0f));
			lineas.add(new LineaFactura("juan", "otras cositas", LocalDate.now(), 13000.0f));
			lineas.add(new LineaFactura("juan", "cositas de juan", LocalDate.now(), 41000.0f));
			f.generarFacturas(lineas);	
			for(Factura fac : f.listaFacturas) {
				System.out.println(fac.getId() + " > " + fac.getCliente() + " : " + fac.getFloat() + " >> " + fac.getFecha());
				lista = fac.getLineas();
				for(LineaFactura lf : lista) {
					System.out.print("\t");
					System.out.println(lf.getSerivicio() + " " + lf.getImporte() + "(" + lf.getIdCliente() + ")");
				}
			}
		}
	}
}
