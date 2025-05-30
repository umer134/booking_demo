'use client'
import { notFound } from "next/navigation";
import Image from "next/image";
import { getEntity } from "@/features/entities/entitiSlice";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import './EntitiesDetails.css';
import { useEffect } from "react";
import { use } from "react";

type Props = {
  params: Promise<{ id: string }> ;
};

export default function EntityPage({ params }: Props) {
  const {id} = use(params)
  const dispatch = useDispatch<AppDispatch>();
  const { entity, loading, error } = useSelector((state: RootState) => state.entity);

  useEffect(() => {
    dispatch(getEntity({entityId: id}))
  }, [])

  if (loading) return <div>Загрузка...</div>;
  if(!loading && !entity && error) return notFound();

  return (
    <div className="entity-page">
      {/* Картинка слева */}
      <div className="entity-image-container">
        <Image
          src={entity?.image_url || "/DefaultImageAppartment.avif"}
          alt={entity?.name || ""}
          width={600}
          height={400}
          className="entity-image"
        />
      </div>

      {/* Инфа справа */}
      <div className="entity-info">
        <h2>{entity?.name}</h2>
        <p><strong>Адрес:</strong> {entity?.address}</p>
        <p><strong>Комнат:</strong> {entity?.capacity}</p>

        {entity?.pdf_path && (
          <a
            href={entity.pdf_path}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="download-pdf-button"
          >
            📄 Скачать PDF
          </a>
        )}
      </div>
    </div>
  );
}