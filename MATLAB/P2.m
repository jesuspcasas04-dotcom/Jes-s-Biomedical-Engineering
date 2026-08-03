
% Delta de Dirac con un impulso en n=0.
n=-5:5; x= (n==0);
stem(n,x);
% Delta de Dirac con un impulto en n=1.
x2=((n-1)==0);
stem(n,x2);

% Escalón unitario.

x3=((n-2)>=0);
stem(n,x3); axis([-10 10 0 1.2]);

% Exponencial compleja, e(σ+jω0)n.

n2=-10:0.1:10;
x4=exp((0.2+3j)*n);
polarplot(angle(x4), abs(x4));

%Sinusoide, cos(ω0n + φ)
n3=-10:10; N=10; w0=2*pi/N ; x5=cos(w0*n3 + pi/3);
stem(n3,x5);

% Una secuencia de N valores aleatorios uniformemente distribuidos en el
% intervalo [0, 1] obtiene del siguiente modo: 

N2=100; x6=rand(1,N); plot(x6);

% Y en el caso de una distribuci´on gaussiana se obtiene una secuencia aleatoria con media nula y desviación estándar 1:
x7=randn(1,N); plot(x7);

% OPERACIONES CON LAS SECUENCIAS. y[n] = x[n − n0]

m = 0:10; % m: indice de la secuencia original
x8 = 0.8.^m; % x: secuencia de entrada
n0 = 3; % n0: desplazamiento
n = m + n0; % n: indice de la secuencia desplazada (salida)
y = x8; % y: secuencia de salida
subplot(211);stem(m,x8);axis([0 15 0 1])
subplot(212);stem(n,y);axis([0 15 0 1])


% Cálculo de energía de una señal finita. 2 formas.
Ex=x8*x8';
Ex2=sum(abs(x8).^2);





