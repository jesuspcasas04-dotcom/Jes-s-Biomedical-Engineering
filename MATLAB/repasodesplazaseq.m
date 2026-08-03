%Ejercicio 3
%Genera una funci´on llamada [y,n]=desplazaseq(x,m,n0) desplace la secuencia x una cantidad de
%muestras igual a n0. Del mismo modo, genera otra funci´on llamada [y,n]=reflexseq(x,n) que realice
%la reflexi´on temporal de una secuencia.
%Muestra el c´odigo de ambas funciones y el resultado al profesor.

function [y,n]= desplazaseq(x, m, n0)
   n=m+n0;
   y=x;
   stem(m,y);
   title('Representación de x');
   stem(n,y);
   title('Desplazamiento de x'); 

end