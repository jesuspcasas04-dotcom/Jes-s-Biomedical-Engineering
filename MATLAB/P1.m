%OPERACIONES BÁSICAS
x=[1 5 8 4];
m=size(x);
% [1,4] una fila y cuatro columnas.

y=x(:);
t=size(y);
% vector(:) da la vuelta al vector de manera que si antes era 1 5 8 4 ahora
% es 1
%    5
%    8
%    4

% Si directamente queremos crear una columna con varias filas separamos el
% vector con ;.

z=[1;5;8;4];
l= size(z);

% Para multiplicar varios vectores deben de tener las mismas dimensiones.
% Ejemplo:

A=[1 2 3; 4 5 6; 7 8 9];
tamA=size(A);
B=[1 2 3; 4 5 6; 7 8 9];
tamB=size(B);

multip_mat=A*B; %Multiplicación matricial.
multip_escalar=A.*B;%Multiplicación escalar.

%¿Como podemos coger determinados datos de una matriz o un vector?

J=A(2,:); % 4,5,6.
Q=A(:,1); % 1,4,7.

MeC=mean(A,1); %Hace la media de cada columna.
MeR= mean(A,2); % Hace la media de cada fila.



