
package pa;


public class Zodiaco {
    private int dia;
    private int mes;
    private String signo;
    
    public Zodiaco(int dia, int mes) {
        this.dia = dia;
        this.mes = mes;
        signo = "Desconocido";
    }

    public int getDia() {
        return dia;
    }

    public int getMes() {
        return mes;
    }
    
    /**
     * Devuelve cierto si la fecha es válida ¨(día: 1..31, mes:1..12), y
       falso en caso contrario   
    */  
    private boolean fecha_valida(int dia,int mes) {
    	boolean valida=false;
    	switch(mes) {
    	case 4:
    	case 6:
    	case 9:
    	case 11:
    		if (dia>=1 && dia<=30) {
    			valida=true;
    		}
    		else {
    			valida= false;
    		}
    		break;
    	case 1:
    	case 2:
    	case 3:
    	case 5:
    	case 7:
    	case 8:
    	case 10:
    	case 12:
    		if (dia>=1 && dia<=31) {
    			valida=true;
    		}
    		else {
    			valida=false;
    		}
    		break;
    	default:
    		valida=false;
    		break;
    	
    	}
    	return valida;
    }

    
 
    /**
     * Devuelve el nombre del signo asociado al día y mes de nacimiento, o el mensaje "Fecha inválida"   
    */
    public 	String obtener_signo() {
    	String signo= "Fecha incorrecta";
    	if (fecha_valida(dia,mes)==false) {
    		return signo;
    		
    	}
    	else {
    		switch(mes) {
    		case 1:
    			if(mes==1 && dia>=1 && dia<=20) {
    				signo="Capricornio";
    				
    			}
    			else {
    				signo="Acuario";
    			}
    			break;
    		case 2:
    			if(mes==2 && dia>=1 && dia<=19) {
    				signo="Acuario";
    				
    			}
    			else {
    				signo="Piscis";
    			}
    			break;
    		case 3:
    			if(mes==3 && dia>=1 && dia<=20) {
    				signo="Piscis";
    				
    			}
    			else {
    				signo="Aries";
    			}
    			break;
    		case 4:
    			if(mes==4 && dia>=1 && dia<=20) {
    				signo="Aries";
    				
    			}
    			else {
    				signo="Tauro";
    			}
    			break;
    		case 5:
    			if(mes==5 && dia>=1 && dia<=21) {
    				signo="Tauro";
    				
    			}
    			else {
    				signo="Géminis";
    			}
    			break;
    		case 6:
    			if(mes==6 && dia>=1 && dia<=21) {
    				signo="Géminis";
    				
    			}
    			else {
    				signo="Cáncer";
    			}
    			break;
    		case 7:
    			if(mes==7 && dia>=1 && dia<=23) {
    				signo="Cáncer";
    				
    			}
    			else {
    				signo="Leo";
    			}
    			break;
    		case 8:
    			if(mes==8 && dia>=1 && dia<=23) {
    				signo="Leo";
    				
    			}
    			else {
    				signo="Virgo";
    			}
    			break;
    		case 9:
    			if(mes==9&&dia>=1 && dia<=23) {
    				signo="Virgo";
    				
    			}
    			else {
    				signo="Libra";
    			}
    			break;
    		case 10:
    			if(mes==10&&dia>=1 && dia<=23) {
    				signo="Libra";
    				
    			}
    			else {
    				signo="Escorpio";
    			}
    			break;
    		case 11:
    			if(mes==11 && dia>=1 && dia<=22) {
    				signo="Escorpio";
    				
    			}
    			else {
    				signo="Sagitario";
    			}
    			break;
    		case 12:
    			if(mes==12&&dia>=1 && dia<=21) {
    				signo="Sagitario";
    				
    			}
    			else {
    				signo="Capricornio";
    			}
    			break;
    		
    		}
    		
    	}
    	return signo;
    }
    	
    }
    	


   
    		
    	
    		
    	
    			
    		
    		

