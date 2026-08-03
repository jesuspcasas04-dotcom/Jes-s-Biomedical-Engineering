%Ejercicio 3
%Genera una función llamada [y,n]=desplazaseq(x,m,n0) desplace la secuencia x una cantidad de
%muestras igual a n0. Del mismo modo, genera otra función llamada [y,n]=reflexseq(x,n) que realice
%la reflexión temporal de una secuencia.

function [y,n]= desplazaseq(x,m,n0)

n=m+n0;
y=x;

stem(n,y);
title(['Secuencia desplazada en ', num2str(n0), ' muestras']);
xlabel('n');
ylabel('y[n]');
grid on;

end