from rest_framework import serializers
from polyclinic.models import *

class BillService:

    def create_bill_item(self, validated_data, is_accounting=False):
        if is_accounting:
            return BillItem.objects.create(**validated_data)
        else:
            bill = validated_data.pop('bill', None)
            medicament = validated_data.pop('medicament', None)
            consultation = validated_data.pop('consultation', None)
            prescription = validated_data.pop('prescription', None)
            examRequest = validated_data.pop('examRequest', None)
            hospitalisation = validated_data.pop('hospitalisation', None)
            quantity = validated_data.pop('quantity', None)
            unity_price = 0
            total = 0
            if bill is None:
                raise serializers.ValidationError("La facture est obligatoire")
            if any([medicament, consultation, hospitalisation, prescription, examRequest]):
                try:
                    if medicament:
                        medicament = PolyclinicProduct.objects.get(id=medicament.id)
                        if medicament and quantity is None:
                            raise serializers.ValidationError(
                                "le nombre de medicament est obligatoire si le medicament est fourni")
                        unity_price = medicament.price
                        total += medicament.price * quantity
                    elif consultation:
                        consultation = Consultation.objects.get(id=consultation.id)
                        consultation.paymentStatus = "Valid"  # on met les éléments à valid
                        consultation.save()
                        unity_price = consultation.consultationPrice
                        total += consultation.consultationPrice
                    elif prescription:
                        prescription = Prescription.objects.get(id=prescription.id)
                        prescription_drug = PrescriptionDrug.objects.filter(prescription=prescription)
                        for item in prescription_drug:
                            medicament = PolyclinicProduct.objects.get(id=item.medicament)
                            total += medicament.price * item.quantity
                        unity_price = total
                    elif examRequest:
                        examRequest = ExamRequest.objects.get(id=examRequest.id)
                        examRequest.patientStatus = "Valid"
                        examRequest.save()
                        exam = Exam.objects.get(id=examRequest.idExam)
                        total += exam.examCost
                        unity_price = exam.examCost
                    elif hospitalisation:
                        hospitalisation = Hospitalisation.objects.get(id=hospitalisation.id)
                        room = Room.objects.get(id=hospitalisation.idRoom)
                        total += room.price
                        unity_price = room.price
                        hospitalisation.paymentStatus = "Valid"
                        hospitalisation.save()
                    bill_item = BillItem.objects.create(
                        bill=bill,
                        medicament=medicament,
                        consultation=consultation,
                        prescription=prescription,
                        examRequest=examRequest,
                        quantity=quantity if quantity is not None else 1,
                        designation=validated_data['designation'],
                        unityPrice=unity_price,
                        total=total,
                    )
                    return bill_item
                except PolyclinicProduct.DoesNotExist:
                    raise serializers.ValidationError("le medicament n'existe pas ou un medicament prescrit n'existe pas")
                except Consultation.DoesNotExist:
                    raise serializers.ValidationError("le consultation n'existe pas")
                except Prescription.DoesNotExist:
                    raise serializers.ValidationError("le prescription n'existe pas")
                except ExamRequest.DoesNotExist:
                    raise serializers.ValidationError("le examrequest n'existe pas")
                except Exam.DoesNotExist:
                    raise serializers.ValidationError("le exam n'existe pas")
                except Hospitalisation.DoesNotExist:
                    raise serializers.ValidationError("le hospitalisation n'existe pas")
                except Room.DoesNotExist:
                    raise serializers.ValidationError("la chambre d'hospitalisation n'existe pas")
            else:
                raise serializers.ValidationError("Au moins un paiment doit être effectué")