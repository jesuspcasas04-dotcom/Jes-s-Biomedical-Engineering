% Ejercicio 2 Práctica 1
%Genera una función llamada escalonseq(n0,n1,n2) que muestre un escalón unitario dentro del inter-
%valo n1 a n2 y que se inicie en un instante n0. Muestra el código y el resultado al profesor.

function escalonseq (n0,n1,n2)

if (n0<n1)||(n0>n2)
    error(" n0 no se encuentra dentro del intervalo [n1-n2]")
end

n=n1:n2; x=(n>=n0);
stem(n,x); axis([n1*2 n2*2 0 1.2]);

title(["Escalón unitario en n= " , num2str(n0)]);
xlabel('n');
ylabel('\delta[n]');
grid on;


end