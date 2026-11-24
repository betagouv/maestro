all: archi dai-flow dai-flow-module-labo rai-flow rai-flow-module-labo flow-sans-edi-sacha database

archi:
	cat architecture.puml | docker run --rm -i -e JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8" plantuml/plantuml:1.2026.10 --svg -p > architecture.svg
dai-flow:
	cat dai-flow.puml | docker run --rm -i -e JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8" plantuml/plantuml:1.2026.10 --svg -p > dai-flow.svg
dai-flow-module-labo:
	cat dai-flow-module-labo.puml | docker run --rm -i -e JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8" plantuml/plantuml:1.2026.10 --svg -p > dai-flow-module-labo.svg
rai-flow:
	cat rai-flow.puml | docker run --rm -i -e JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8" plantuml/plantuml:1.2026.10 --svg -p > rai-flow.svg
rai-flow-module-labo:
	cat rai-flow-module-labo.puml | docker run --rm -i -e JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8" plantuml/plantuml:1.2026.10 --svg -p > rai-flow-module-labo.svg
flow-sans-edi-sacha:
	cat flow-sans-edi-sacha.puml | docker run --rm -i -e JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8" plantuml/plantuml:1.2026.10 --svg -p > flow-sans-edi-sacha.svg
database:
	 # Planter vient de https://github.com/achiku/planter
	 docker run --net=maestro_default --rm agileek/planter planter postgres://postgres:password@maestro_db/maestro?sslmode=disable > maestro-db.uml
	 cat maestro-db.uml | docker run --rm -i plantuml/plantuml:1.2026.10 --svg -p > maestro-db.svg
