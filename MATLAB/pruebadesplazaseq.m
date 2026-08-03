 m = 0:10; % m: indice de la secuencia original
 x = 0.8.^m; % x: secuencia de entrada
 n0 = 3; % n0: desplazamiento
 n = m + n0; % n: indice de la secuencia desplazada (salida)
 
 [y,n] =desplazaseq(x,m,n0);