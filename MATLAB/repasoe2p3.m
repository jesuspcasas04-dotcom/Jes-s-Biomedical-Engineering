% 1º Definimos x[n].

n=-3:3;
x=[3 11 7 0 -1 4 2];
 
% 2º Desplazamos x en dos unidades.

 [y,n]= desplazaseq(x,n,2);
 y=[0 0 y];

% Le añadimos ruido gausiano.

ruido_g= randn(1, length(y));
y1=y+ ruido_g;

% Ahora le añadimos ruido gausiano con mayor varianza.

ruido_gx10= 10* randn(1, length(y));
y2= y+ ruido_gx10;

% Calculamos la correlación de ambos casos.

[corry1, lag1] = xcorr(y1, x);
[corry2, lag2]= xcorr(y2,x);


