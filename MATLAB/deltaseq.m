% Ejercicio 1 práctica 2.
% Genera una función llamada deltaseq(n0,n1,n2) que muestre una delta dentro del intervalo n1 a n2
% y localizada en un instante n0. Muestra el c´odigo y el resultado al profesor.

function deltaseq (n0,n1,n2)

% Primero nos debemos asegurar que n0 está entre n1 y n2.

if (n0<n1) || (n0>n2)
    error("El valor de n0 debe de estar en el intervalo [n0,n1]");
end

% Ahora ponemos el intervalo y la condición.

n=n1:n2;
x=(n==n0);
stem(n, x);
title(['Delta de Dirac en n = ', num2str(n0)]);
xlabel('n');
ylabel('\delta[n]');
grid on;

end

